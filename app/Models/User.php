<?php

	namespace App\Models;

	use App\Enums\UserType;
    use BezhanSalleh\FilamentShield\Traits\HasPanelShield;
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
	use Spatie\Permission\Traits\HasRoles;

	class User extends Authenticatable implements HasMedia, MustVerifyEmail, FilamentUser
	{
		use HasFactory, Notifiable;
		use InteractsWithMedia, SoftDeletes;
		use HasRoles;
		use HasPanelShield;





		/**
		 * The attributes that are mass assignable.
		 *
		 * @var array<int, string>
		 */
		protected $fillable = [
			'name',
			'type',
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
				'type' => UserType::class,
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
