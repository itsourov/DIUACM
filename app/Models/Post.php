<?php

	namespace App\Models;


	use App\Enums\AccessStatuses;
	use App\Enums\VisibilityStatuses;
	use App\Forms\PostForm;
	use Illuminate\Database\Eloquent\Builder;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsTo;
	use Illuminate\Database\Eloquent\Relations\MorphMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Spatie\Image\Enums\Fit;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	use Spatie\MediaLibrary\MediaCollections\Models\Media;

	class Post extends Model  implements HasMedia
	{
		use InteractsWithMedia;
		use SoftDeletes, HasFactory;

		protected $fillable = [
			'title',
			'slug',
			'sub_title',
			'content',
			'status',
			'user_id',
		];

		protected function casts(): array
		{
			return [
				'status' => VisibilityStatuses::class,
			];
		}

		public function categories()
		{
			return $this->belongsToMany(Category::class, );
		}

		public function user(): BelongsTo
		{
			return $this->belongsTo(User::class);
		}
		public function isNotPublished()
		{
			return !$this->isStatusPublished();
		}

		public function scopePublished(Builder $query)
		{
			return $query->where('status', VisibilityStatuses::PUBLISHED)->latest('updated_at');
		}
		public function scopeScheduled(Builder $query)
		{
			return $query->where('status', VisibilityStatuses::SCHEDULED)->latest('scheduled_for');
		}

		public function scopePending(Builder $query)
		{
			return $query->where('status', VisibilityStatuses::PENDING)->latest('created_at');
		}


		public function formattedPublishedDate()
		{
			return $this->created_at?->format('d M Y');
		}

		public function isScheduled()
		{
			return $this->status === VisibilityStatuses::SCHEDULED;
		}
		public function isStatusPublished()
		{
			return $this->status === VisibilityStatuses::PUBLISHED;
		}
		public function relatedPosts($take = 3)
		{
			return $this->whereHas('categories', function ($query) {
				$query->whereIn( 'categories.id', $this->categories->pluck('id'))
					->whereNotIn('posts.id', [$this->id]);
			})->published()->take($take)->get();
		}

		public static function getForm()
		{
			return PostForm::getComponents();
		}
		public function registerMediaConversions(Media|null $media = null): void
		{
			$this
				->addMediaConversion('preview')
				->fit(Fit::Contain, 400, 300)
				->queued();
		}

		public function comments(): MorphMany
		{
			return $this->morphMany(Comment::class, 'commentable');
		}
	}
