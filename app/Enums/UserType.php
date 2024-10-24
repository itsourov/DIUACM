<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum UserType: string implements HasColor, HasIcon, HasLabel
{
    case PENDING = 'pending';
    case MENTOR = 'mentor';
    case CURRENT_CODERS = 'current_coders';
    case Veteran = 'veteran';

    public function getColor(): string
    {
        return match ($this) {
            self::PENDING => 'info',
            self::CURRENT_CODERS => 'success',
            self::Veteran => 'danger',
            self::MENTOR => 'warning',
        };
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::CURRENT_CODERS => 'Current Coders',
            self::Veteran => 'Veteran',
            self::MENTOR => 'Mentor',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::PENDING => 'heroicon-o-information-circle',
            self::CURRENT_CODERS => 'heroicon-o-information-circle',
            self::Veteran => 'heroicon-o-information-circle',
            self::MENTOR => 'heroicon-o-information-circle',

        };
    }
	public static function toArray(): array
	{
		return array_map(fn($case) => $case->value, self::cases());
	}
}
