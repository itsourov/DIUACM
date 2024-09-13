<?php
	
	namespace App\Filament\Resources\TrackerResource\Pages;
	
	use App\Filament\Resources\TrackerResource;
	use Filament\Resources\Pages\CreateRecord;
	
	class CreateTracker extends CreateRecord
	{
		protected static string $resource = TrackerResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
			
			];
		}
	}
