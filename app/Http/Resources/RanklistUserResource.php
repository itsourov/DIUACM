<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RanklistUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'name' => $this->name,
            'score' => $this->score,
            'pp' => $this->getFirstMediaUrl('profile-images', 'preview'),
            'cnt' => $this->solveCounts->map(function ($solve) {
                return [
                    $solve->solve_count,
                    $solve->upsolve_count,
                    $solve->absent,
                    $solve->error,
                ];
            }),
        ];
    }
}
