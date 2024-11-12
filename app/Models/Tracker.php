<?php

namespace App\Models;

use App\Enums\AccessStatuses;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tracker extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'title',
        'last_updated',
        'slug',
        'type',
        'description',
        'can_add_self',
        'can_remove_self',
        'auto_add',
        'count_upsolve',
        'embedded_content',
        'original_link'
    ];

    protected function casts()
    {
        return [

            'organized_for' => AccessStatuses::class,
            'last_updated' => 'datetime',

        ];
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class)->orderByDesc('starting_time');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('score');
    }
}
