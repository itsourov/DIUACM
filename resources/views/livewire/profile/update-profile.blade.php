<div>
	<form wire:submit="save">
		{{ $this->form }}

		<x-button.primary class="mt-4">
			Submit
		</x-button.primary>
	</form>

	<x-filament-actions::modals />
</div>
