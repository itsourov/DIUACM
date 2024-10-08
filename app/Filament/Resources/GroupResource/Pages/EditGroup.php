<?php
	
	namespace App\Filament\Resources\GroupResource\Pages;
	
	use App\Filament\Resources\GroupResource;
	use Filament\Actions\DeleteAction;
	use Filament\Actions\ForceDeleteAction;
	use Filament\Actions\RestoreAction;
	use Filament\Resources\Pages\EditRecord;
	
	class EditGroup extends EditRecord
	{
		protected static string $resource = GroupResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				DeleteAction::make(),
				ForceDeleteAction::make(),
				RestoreAction::make(),
			];
		}
	}
