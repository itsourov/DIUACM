<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum TrackerType: string implements HasColor, HasIcon, HasLabel
{
    case EMBEDDED = 'embedded';
    case DYNAMIC = 'dynamic';

    public function getColor(): string
    {
        return match ($this) {
            self::DYNAMIC => 'info',
            self::EMBEDDED => 'success'
        };
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::DYNAMIC => 'Dynamic',
            self::EMBEDDED => 'Embedded',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::DYNAMIC => 'heroicon-o-information-circle',
            self::EMBEDDED => 'heroicon-o-information-circle',
        };
    }
	public static function toArray(): array
	{
		return array_map(fn($case) => $case->value, self::cases());
	}
}
