<?php

namespace App\Filament\Resources\EventResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AttendersRelationManager extends RelationManager
{
    protected static string $relationship = 'attenders';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('extra_info')
                    ->maxLength(255),
	            DateTimePicker::make('updated_at')
		            ->seconds(false),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
	            SpatieMediaLibraryImageColumn::make('profile Image')
		            ->collection('profile-images')
		            ->disk('profile-images'),
                Tables\Columns\TextColumn::make('name'),
	            Tables\Columns\TextColumn::make('extra_info'),
	            Tables\Columns\TextColumn::make('updated_at')
	            ->label('Attendance Time'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\AttachAction::make()
	                ->label("Add Attender")
	                ->recordSelectSearchColumns(['name', 'email'])
	            ->preloadRecordSelect(),
	            
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DetachAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DetachBulkAction::make(),
                ]),
            ]);
    }
}
