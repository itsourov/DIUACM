<?php

namespace App\Filament\Resources;


use App\Enums\UserType;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use BezhanSalleh\FilamentShield\Contracts\HasShieldPermissions;
use Filament\Forms;
use Filament\Forms\Components\Actions\Action;
use Filament\Forms\Components\ToggleButtons;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use STS\FilamentImpersonate\Tables\Actions\Impersonate;

class UserResource extends Resource  implements HasShieldPermissions
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
	    return $form
		    ->schema([
			    Forms\Components\TextInput::make('name')
				    ->required()
				    ->maxLength(255),
			    Forms\Components\TextInput::make('username')
				    ->required()
				    ->maxLength(255),
			    Forms\Components\TextInput::make('email')
				    ->email()
				    ->required()
				    ->maxLength(255),
			    Forms\Components\Textarea::make('bio')
				    ->columnSpanFull(),
			    Forms\Components\TextInput::make('phone')
				    ->tel()
				    ->maxLength(255),
			    Forms\Components\TextInput::make('student_id')
				    ->maxLength(255),
			    Forms\Components\TextInput::make('codeforces_username')
				    ->maxLength(255),
			    Forms\Components\TextInput::make('vjudge_username')
				    ->maxLength(255),
			    Forms\Components\TextInput::make('atcoder_username')
				    ->maxLength(255),
			    Forms\Components\DateTimePicker::make('email_verified_at'),
//			    Forms\Components\TextInput::make('password')
//				    ->password()
//				    ->required()
//				    ->maxLength(255),
                ToggleButtons::make('type')
                    ->inline()
                    ->options(UserType::class)
                    ->required(),
			    Forms\Components\Select::make('roles')
				    ->relationship('roles', 'name')
				    ->visible(auth()->user()->hasPermissionTo('manage_role_user'))
				    ->multiple()
				    ->preload()
				    ->searchable()
		    ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
	            SpatieMediaLibraryImageColumn::make('profile Image')
		            ->collection('profile-images')
		            ->disk('profile-images'),
                Tables\Columns\TextColumn::make('username')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email_verified_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('deleted_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
	            Impersonate::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

	public static function getPermissionPrefixes(): array
	{
		return [
			'view',
			'view_any',
			'create',
			'update',
			'restore',
			'restore_any',
			'replicate',
			'reorder',
			'delete',
			'delete_any',
			'force_delete',
			'force_delete_any',
			'manage_role'
		];
	}
}
