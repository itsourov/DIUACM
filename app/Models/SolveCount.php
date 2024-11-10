<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolveCount extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'solve_count',
        'upsolve_count',
        'absent',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'absent' => 'boolean',
        ];
    }
}
