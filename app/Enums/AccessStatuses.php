<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum AccessStatuses: string implements HasColor, HasIcon, HasLabel
{
    case SELECTED_PERSONS = 'selected-persons';
    case OPEN_FOR_ALL = 'open-for-all';
   

    public function getColor(): string
    {
        return match ($this) {
            self::SELECTED_PERSONS => 'info',
            self::OPEN_FOR_ALL => 'success'
        };
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::SELECTED_PERSONS => 'Selected Persons',
            self::OPEN_FOR_ALL => 'Open for all',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::OPEN_FOR_ALL => 'heroicon-o-user-group',
            self::SELECTED_PERSONS => 'heroicon-o-lock-closed',
        };
    }
	public static function toArray(): array
	{
		return array_map(fn($case) => $case->value, self::cases());
	}
}
