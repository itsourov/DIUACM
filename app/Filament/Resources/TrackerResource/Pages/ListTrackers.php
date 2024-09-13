<?php
	
	namespace App\Filament\Resources\TrackerResource\Pages;
	
	use App\Filament\Resources\TrackerResource;
	use Filament\Actions\CreateAction;
	use Filament\Resources\Pages\ListRecords;
	
	class ListTrackers extends ListRecords
	{
		protected static string $resource = TrackerResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				CreateAction::make(),
			];
		}
	}
