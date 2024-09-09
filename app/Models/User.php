<?php
	
	namespace App\Models;
	
	use Filament\Models\Contracts\FilamentUser;
	use Filament\Panel;
	use Illuminate\Contracts\Auth\MustVerifyEmail;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Illuminate\Foundation\Auth\User as Authenticatable;
	use Illuminate\Notifications\Notifiable;
	use Spatie\Image\Enums\Fit;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	use Spatie\MediaLibrary\MediaCollections\Models\Media;
	
	class User extends Authenticatable implements HasMedia, MustVerifyEmail, FilamentUser
	{
		use HasFactory, Notifiable;
		use InteractsWithMedia, SoftDeletes;
		
		
		public function canAccessPanel(Panel $panel): bool
		{
			return (
				($this->email == 'sourov2305101004@diu.edu.bd' && $this->hasVerifiedEmail()) ||
				($this->email == 'sakib22205101951@diu.edu.bd' && $this->hasVerifiedEmail())
			
			);
			// return str_ends_with($this->email, '@yourdomain.com') && $this->hasVerifiedEmail();
		}
		
		
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
			'bio',
			'phone',
			'student_id',
			'codeforces_username',
			'vjudge_username',
			'atcoder_username',
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
		
		public function events(): BelongsToMany
		{
			return $this->belongsToMany(Event::class)->withPivot(['extra_info']);
		}
	}
