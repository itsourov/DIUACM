<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum EventTypes: string implements HasColor, HasIcon, HasLabel
{
    case CONTEST = 'contest';
    case _CLASS = 'class';
    case OTHER = 'other';

    public function getColor(): string
    {
        return match ($this) {
            self::CONTEST => 'info',
            self::_CLASS => 'warning',
            self::OTHER => 'success'
        };
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::CONTEST => 'Contest',
            self::_CLASS => 'Class',
            self::OTHER => 'Other'
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::CONTEST => 'heroicon-o-computer-desktop',
            self::_CLASS => 'heroicon-o-academic-cap',
            self::OTHER => 'heroicon-o-information-circle',
        };
    }
	public static function toArray(): array
	{
		return array_map(fn($case) => $case->value, self::cases());
	}
}
