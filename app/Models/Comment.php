<?php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsTo;
	use Illuminate\Database\Eloquent\Relations\HasMany;
	use Illuminate\Database\Eloquent\Relations\MorphTo;
	use Illuminate\Database\Eloquent\SoftDeletes;
	
	class Comment extends Model
	{
		use SoftDeletes, HasFactory;
		
		protected $fillable = [
			'user_id',
			'parent_id',
			'commentable',
			'comment',
			'rating',
		];
		
		public function commentable(): MorphTo
		{
			return $this->morphTo();
		}
		
		public function user(): BelongsTo
		{
			return $this->belongsTo(User::class);
		}
		
		public function replies(): HasMany
		{
			return $this->hasMany(Comment::class, 'parent_id')->withTrashed();
		}
		
		public function parent(): BelongsTo
		{
			return $this->belongsTo(Comment::class, 'parent_id');
		}
	}
