<?php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Spatie\Image\Enums\Fit;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	use Spatie\MediaLibrary\MediaCollections\Models\Media;
	
	class Gallery extends Model implements HasMedia
	{
		use SoftDeletes, HasFactory;
		use InteractsWithMedia;
		
		protected $fillable = [
			'title',
			'description',
		];
		
		public function registerMediaCollections(): void
		{
			$this
				->addMediaCollection('gallery-images')
				->useFallbackUrl(asset('images/user.png'))
				->useFallbackPath(public_path('/images/user.png'));
	
		}
		public function registerMediaConversions(Media|null $media = null): void
		{
			$this
				->addMediaConversion('preview')
				->fit(Fit::Crop, 300, 300)
				->queued();
			$this
				->addMediaConversion('medium')
				->fit(Fit::Crop, 1000, 700)
				->queued();
		}
	}
