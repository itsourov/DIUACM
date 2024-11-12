<?php

namespace App\Filament\Resources\TrackerResource\RelationManagers;

use App\Enums\AccessStatuses;
use App\Filament\Resources\UserResource;
use App\Models\Group;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UsersRelationManager extends RelationManager
{
    protected static string $relationship = 'users';
    protected static ?string $title = "Selected Users";


    public function form(Form $form): Form
    {
        return UserResource::form($form);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns(UserResource::table($table)->getColumns())
            ->filters([
                //
            ])
            ->headerActions([
                Action::make('attachGroupUsers')
                    ->label('Attach Group Users')
                    ->action(function (array $data) {
                        $group = Group::find($data['group_id']);
                        $users = $group->users;

                        $this->ownerRecord->users()->syncWithoutDetaching($users->pluck('id')->toArray());

                        Notification::make()
                            ->title('Success')
                            ->body('All users from the group have been attached to this tracker.')
                            ->success()
                            ->send();
                    })
                    ->form([
                        Select::make('group_id')
                            ->label('Select Group')
                            ->options(
                                Group::pluck('title', 'id')
                            )
                            ->required(),
                    ]),

                Action::make('detachGroupUsers')
                    ->label('Detach Group Users')
                    ->action(function (array $data) {
                        $group = Group::find($data['group_id']);
                        $users = $group->users;

                        $this->ownerRecord->users()->detach($users->pluck('id')->toArray());

                        Notification::make()
                            ->title('Success')
                            ->body('All users from the group have been detached from this tracker.')
                            ->success()
                            ->send();
                    })
                    ->form([
                        Select::make('group_id')
                            ->label('Select Group')
                            ->options(
                                Group::pluck('title', 'id')
                            )
                            ->required(),
                    ]),
                Tables\Actions\AttachAction::make()
                    ->multiple()
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
