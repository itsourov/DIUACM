<?php
	
	namespace App\Filament\Resources\GalleryResource\Pages;
	
	use App\Filament\Resources\GalleryResource;
	use Filament\Actions\DeleteAction;
	use Filament\Actions\ForceDeleteAction;
	use Filament\Actions\RestoreAction;
	use Filament\Resources\Pages\EditRecord;
	
	class EditGallery extends EditRecord
	{
		protected static string $resource = GalleryResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				DeleteAction::make(),
				ForceDeleteAction::make(),
				RestoreAction::make(),
			];
		}
	}
