<?php

namespace App\Models;

use App\Enums\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class BlogPost extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;

    protected $fillable = [
        'title',
        'slug',
        'author',
        'content',
        'status',
        'published_at',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
            'status' => Visibility::class,
        ];
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this
            ->addMediaConversion('preview')
            ->fit(Fit::Contain, 300, 300)
            ->queued();
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('post-featured-images')
            ->useFallbackUrl('/images/anonymous-user.webp')
            ->useFallbackPath(public_path('/images/anonymous-user.webp'));
    }

    public function scopePublished(Builder $query)
    {
        return $query->where('status', Visibility::PUBLISHED)->latest('published_at');
    }
}
