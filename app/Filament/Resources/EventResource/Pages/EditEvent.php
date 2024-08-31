<?php
	
	namespace App\Filament\Resources\EventResource\Pages;
	
	use App\Filament\Resources\EventResource;
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
				DeleteAction::make(),
				ForceDeleteAction::make(),
				RestoreAction::make(),
			];
		}
	}
