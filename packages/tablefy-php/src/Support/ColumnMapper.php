<?php

namespace Nccirtu\Tablefy\Support;

use Illuminate\Support\Str;

/**
 * Maps introspected DB columns to the generated artefacts: TS type, table
 * columns, view-page detail fields, form fields, and PHP validation rules.
 *
 * Foreign keys (`*_id`, passed in via $relations) become a relationship Select
 * (form) + a related-attribute column (table). DB enums become a Select (form)
 * + an EnumColumn (table).
 *
 * @param array<int, array{name:string, type:string, nullable:bool}> $columns
 */
class ColumnMapper
{
    /** Columns never shown as a form field. */
    protected const SKIP_FIELDS = ['id', 'created_at', 'updated_at', 'deleted_at'];

    /** Columns never shown as a table column. */
    protected const SKIP_COLUMNS = ['updated_at', 'deleted_at', 'password', 'remember_token'];

    /**
     * @param  array<int, array{name:string, type:string, nullable:bool}>  $columns
     * @param  array<string, array{relation:string, model:string, label:string, optionsProp:string}>  $relations
     * @param  array<int, string>  $skip  Columns kept out of the table, the form
     *                                    and the rules — e.g. the tenant key,
     *                                    which the backend sets itself.
     */
    public static function build(array $columns, string $singular, array $relations = [], array $skip = []): array
    {
        $type = [];
        $tableColumns = [];
        $detailFields = [];
        $formFields = [];
        $rules = [];
        $relationTypeProps = [];

        $record = Str::camel($singular);

        foreach ($columns as $col) {
            $name = $col['name'];
            $rawType = $col['type'] ?? 'string';
            $t = self::normalize($rawType);
            $nullable = (bool) ($col['nullable'] ?? true);
            $label = Str::headline($name);
            $rel = $relations[$name] ?? null;

            // --- TS type ---
            $type[] = "  {$name}: " . self::tsType($t) . ($nullable ? ' | null' : '') . ';';

            if (in_array($name, $skip, true)) {
                continue;
            }

            // --- Table column + detail field ---
            if (! in_array($name, self::SKIP_COLUMNS, true)) {
                if ($rel) {
                    $relLabel = Str::headline($rel['relation']);
                    $tableColumns[] = "    TextColumn.make<{$singular}>(\"{$rel['relation']}.{$rel['label']}\").label(\"{$relLabel}\").sortable(),";
                    $detailFields[] = "                      <Field label=\"{$relLabel}\" value={{$record}.{$rel['relation']}?.{$rel['label']}} />,";
                    $relationTypeProps[$rel['relation']] = "  {$rel['relation']}?: { id: number; {$rel['label']}: string } | null;";
                } elseif ($t === 'enum') {
                    $opts = self::enumOptionsTs($rawType);
                    $tableColumns[] = "    EnumColumn.make<{$singular}>(\"{$name}\").label(\"{$label}\").options([{$opts}]),";
                    $detailFields[] = "                      <Field label=\"{$label}\" value={{$record}.{$name}} />,";
                } else {
                    $tableColumns[] = '    ' . self::tableColumn($name, $t, $label, $singular) . ',';
                    $detailFields[] = "                      <Field label=\"{$label}\" value={{$record}.{$name}} />,";
                }
            }

            // --- Form field + rule ---
            if (! in_array($name, self::SKIP_FIELDS, true)) {
                $required = $nullable ? '' : '.required()';
                if ($rel) {
                    $relLabel = Str::headline($rel['relation']);
                    $formFields[] = "    Select.make<{$singular}>(\"{$name}\").label(\"{$relLabel}\").optionsFrom(\"{$rel['optionsProp']}\").searchable(){$required},";
                } elseif ($t === 'enum') {
                    $opts = self::enumOptionsTs($rawType);
                    $formFields[] = "    Select.make<{$singular}>(\"{$name}\").label(\"{$label}\").options([{$opts}]){$required},";
                } else {
                    $formFields[] = '    ' . self::formField($name, $t, $label, $singular, $required) . ',';
                }
                $rules[] = "            '{$name}' => " . self::rule($t, $nullable, $rel) . ',';
            }
        }

        // Relation props appended to the TS type (so `company.name` accessors type-check).
        foreach ($relationTypeProps as $prop) {
            $type[] = $prop;
        }

        return [
            'type' => implode("\n", $type),
            'tableColumns' => implode("\n", $tableColumns),
            'detailFields' => implode("\n", $detailFields),
            'formFields' => implode("\n", $formFields),
            'rules' => implode("\n", $rules),
        ];
    }

    /** Parse `enum('active','inactive')` → `{ value: "active", label: "Active" }, …`. */
    protected static function enumOptionsTs(string $rawType): string
    {
        if (! preg_match("/enum\\((.*)\\)/i", $rawType, $m)) {
            return '';
        }
        preg_match_all("/'([^']*)'/", $m[1], $vals);

        return implode(', ', array_map(
            fn (string $v) => '{ value: "' . $v . '", label: "' . Str::headline($v) . '" }',
            $vals[1],
        ));
    }

    protected static function normalize(string $type): string
    {
        $t = strtolower($type);
        if (preg_match('/enum|set\(/', $t)) return 'enum';
        if (str_contains($t, 'int')) {
            return str_contains($t, 'tinyint') ? 'boolean' : 'number';
        }
        if (preg_match('/decimal|numeric|float|double|real/', $t)) return 'number';
        if (preg_match('/bool/', $t)) return 'boolean';
        if (preg_match('/datetime|timestamp/', $t)) return 'datetime';
        if (preg_match('/date/', $t)) return 'date';
        if (preg_match('/json|jsonb/', $t)) return 'json';
        if (preg_match('/text/', $t)) return 'text';
        return 'string';
    }

    protected static function tsType(string $t): string
    {
        return match ($t) {
            'number' => 'number',
            'boolean' => 'boolean',
            'json' => 'unknown',
            default => 'string', // string, text, date, datetime, enum
        };
    }

    protected static function tableColumn(string $name, string $t, string $label, string $s): string
    {
        return match ($t) {
            'boolean' => "BadgeColumn.make<{$s}>(\"{$name}\").label(\"{$label}\").boolean()",
            'number' => "NumberColumn.make<{$s}>(\"{$name}\").label(\"{$label}\").sortable()",
            'date', 'datetime' => "DateColumn.make<{$s}>(\"{$name}\").label(\"{$label}\").relative()",
            default => "TextColumn.make<{$s}>(\"{$name}\").label(\"{$label}\").sortable()",
        };
    }

    protected static function formField(string $name, string $t, string $label, string $s, string $req): string
    {
        return match ($t) {
            'boolean' => "Toggle.make<{$s}>(\"{$name}\").label(\"{$label}\"){$req}",
            'text', 'json' => "Textarea.make<{$s}>(\"{$name}\").label(\"{$label}\"){$req}",
            'date', 'datetime' => "DatePicker.make<{$s}>(\"{$name}\").label(\"{$label}\"){$req}",
            'number' => "TextInput.make<{$s}>(\"{$name}\").label(\"{$label}\").number(){$req}",
            default => "TextInput.make<{$s}>(\"{$name}\").label(\"{$label}\"){$req}",
        };
    }

    protected static function rule(string $t, bool $nullable, ?array $rel = null): string
    {
        $head = $nullable ? "'nullable'" : "'required'";
        if ($rel) {
            // FK → exists rule against the related table.
            $table = Str::snake(Str::pluralStudly($rel['model']));
            return "[{$head}, 'exists:{$table},id']";
        }
        $body = match ($t) {
            'number' => "'numeric'",
            'boolean' => "'boolean'",
            'date', 'datetime' => "'date'",
            'json' => "'array'",
            // A TEXT column takes far more than 255 characters; capping it here
            // would reject values the database happily stores.
            'text' => "'string'",
            default => "'string', 'max:255'",
        };
        return "[{$head}, {$body}]";
    }
}
