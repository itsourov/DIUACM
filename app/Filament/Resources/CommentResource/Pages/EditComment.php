<?php
	
	namespace App\Filament\Resources\CommentResource\Pages;
	
	use App\Filament\Resources\CommentResource;
	use Filament\Actions\DeleteAction;
	use Filament\Actions\ForceDeleteAction;
	use Filament\Actions\RestoreAction;
	use Filament\Resources\Pages\EditRecord;
	
	class EditComment extends EditRecord
	{
		protected static string $resource = CommentResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				DeleteAction::make(),
				ForceDeleteAction::make(),
				RestoreAction::make(),
			];
		}
	}
