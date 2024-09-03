<?php
	
	namespace App\Filament\Resources\AttendanceResource\Pages;
	
	use App\Filament\Resources\AttendanceResource;
	use Filament\Actions\CreateAction;
	use Filament\Resources\Pages\ListRecords;
	
	class ListAttendances extends ListRecords
	{
		protected static string $resource = AttendanceResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				CreateAction::make(),
			];
		}
	}
