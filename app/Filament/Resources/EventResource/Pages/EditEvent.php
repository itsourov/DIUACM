<?php
	
	namespace App\Filament\Resources\EventResource\Pages;
	
	use App\Events\EventNotification;
	use App\Filament\Resources\EventResource;
	use App\Models\Event;
	use Filament\Actions\Action;
	use Filament\Actions\DeleteAction;
	use Filament\Actions\ForceDeleteAction;
	use Filament\Actions\RestoreAction;
	use Filament\Resources\Pages\EditRecord;
	
	class EditEvent extends EditRecord
	{
		protected static string $resource = EventResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				Action::make('sendNotification')
					->label('Send Notification')
					->requiresConfirmation()
					->icon('heroicon-o-bell')->action(function (Event $record) {
						event(new EventNotification($record));
					})
					->disabled(function (Event $record) {
						return false;
//						return $record->isNotPublished();
					}),
				DeleteAction::make(),
				ForceDeleteAction::make(),
				RestoreAction::make(),
			];
		}
	}
