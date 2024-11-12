<?php

namespace App\Filament\Resources;

use App\Enums\AccessStatuses;
use App\Enums\TrackerType;
use App\Filament\Resources\EventResource\RelationManagers\AttendersRelationManager;
use App\Filament\Resources\TrackerResource\Pages;
use App\Filament\Resources\TrackerResource\RelationManagers\UsersRelationManager;
use App\Models\Group;
use App\Models\Tracker;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ToggleButtons;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ForceDeleteAction;
use Filament\Tables\Actions\ForceDeleteBulkAction;
use Filament\Tables\Actions\RestoreAction;
use Filament\Tables\Actions\RestoreBulkAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TrackerResource extends Resource
{
    protected static ?string $model = Tracker::class;

    protected static ?string $slug = 'trackers';

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Placeholder::make('created_at')
                    ->label('Created Date')
                    ->content(fn(?Tracker $record): string => $record?->created_at?->diffForHumans() ?? '-'),

                Placeholder::make('updated_at')
                    ->label('Last Modified Date')
                    ->content(fn(?Tracker $record): string => $record?->updated_at?->diffForHumans() ?? '-'),

                TextInput::make('title')
                    ->required(),

                TextInput::make('slug')
                    ->placeholder('individual-tracker-icpc-2024')
                    ->helperText('Cannot contain spaces or special characters.')
                    ->rules(['required', 'regex:/^[a-zA-Z0-9-]+$/'])
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                TextInput::make('description'),
                Select::make('events')
                    ->label('Selected Events')
                    ->relationship('events', 'title')
                    ->multiple()
                    ->preload(),
                ToggleButtons::make('type')
                    ->live()
                    ->inline()
                    ->options(TrackerType::class)
                    ->required(),
                Section::make('Tracker Config')
                    ->visible(function ($get) {
                        return $get('type') === TrackerType::DYNAMIC->value;
                    })
                    ->columns(2)
                    ->schema([

                        Toggle::make('count_upsolve')->default(true),
                        Toggle::make('can_add_self')->default(true),
                        Toggle::make('can_remove_self')->default(true),
                        Toggle::make('auto_add')->default(true),
                    ]),
                Section::make('Tracker Config')
                    ->visible(function ($get) {
                        return $get('type') === TrackerType::EMBEDDED->value;
                    })
                    ->columns(2)
                    ->schema([

                        TextArea::make('embedded_content')
                            ->columnSpan([
                                'lg' => 2,
                            ])
                            ->required(),
                        TextInput::make('original_link'),
                    ]),


            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('keyword'),

                TextColumn::make('description'),
            ])
            ->filters([
                TrashedFilter::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
                RestoreAction::make(),
                ForceDeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    RestoreBulkAction::make(),
                    ForceDeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTrackers::route('/'),
            'create' => Pages\CreateTracker::route('/create'),
            'edit' => Pages\EditTracker::route('/{record}/edit'),
        ];
    }

    public static function getRelations(): array
    {
        return [
            UsersRelationManager::class,
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title'];
    }
}
