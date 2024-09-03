<?php
	
	namespace App\Models;
	
	use Illuminate\Contracts\Auth\MustVerifyEmail;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\Relations\HasMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Illuminate\Foundation\Auth\User as Authenticatable;
	use Illuminate\Notifications\Notifiable;
	use Spatie\Image\Enums\Fit;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	use Spatie\MediaLibrary\MediaCollections\Models\Media;
	
	class User extends Authenticatable  implements HasMedia, MustVerifyEmail
	{
		use HasFactory, Notifiable;
		use InteractsWithMedia, SoftDeletes;
		
		/**
		 * The attributes that are mass assignable.
		 *
		 * @var array<int, string>
		 */
		protected $fillable = [
			'name',
			'email',
			'password',
			'username',
		];
		
		/**
		 * The attributes that should be hidden for serialization.
		 *
		 * @var array<int, string>
		 */
		protected $hidden = [
			'password',
			'remember_token',
		];
		
		/**
		 * Get the attributes that should be cast.
		 *
		 * @return array<string, string>
		 */
		protected function casts(): array
		{
			return [
				'email_verified_at' => 'datetime',
				'password' => 'hashed',
			];
		}
		
		public function registerMediaCollections(): void
		{
			$this
				->addMediaCollection('profile-images')
				->useFallbackUrl(asset('images/user.png'))
				->useFallbackPath(public_path('/images/user.png'));
		}
		public function registerMediaConversions(Media|null $media = null): void
		{
			$this
				->addMediaConversion('preview')
				->fit(Fit::Crop, 300, 300)
				->queued();
		}
		
		
		public function groups(): BelongsToMany
		{
			return $this->belongsToMany(Group::class);
		}
		
		public function attendances(): HasMany
		{
			return $this->hasMany(Attendance::class);
		}
	}
