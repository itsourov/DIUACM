<?php

namespace App\Http\Helpers\ContestDataManager;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class Vjudge
{
    private static string $userAgent = 'PostmanRuntime/7.26.10';

    private static function fetchCurl(string $url)
    {
//			$cookie = Cache::get('vjudge-cookie');
//			if (!$cookie) {
//				return ['error' => 'Need Vjudge Authentication'];
//			}
        return cache()->remember('vjudge_get_' . $url, now()->addHours(2), function () use ($url) {
            $contestResponse = Http::withHeaders([
                'User-Agent' => self::$userAgent,
//					'Cookie' => $cookie,
            ])->get($url);
            return $contestResponse->json();
        });


    }

    public static function getContestDataOfAUser(string $contestLink, string $username): array
    {
        // Validate and parse the contest link
        $parsedUrl = parse_url($contestLink);


        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));

        if ($pathSegments[0] !== 'contest') {
            return ['error' => 'Not a valid contest URL'];
        }
        $contestID = $pathSegments[1];


        // Get the contest data from VJudge
        $responseData = self::fetchCurl("https://vjudge.net/contest/rank/single/" . $contestID);
			if (!$responseData) {
				return ['error' => 'i see blank'];

			}
        if (isset($responseData['error'])) {
            return $responseData;

        }


        $time = $responseData['length'] ?? 0 / 1000;
        $participants = $responseData['participants']??[];
        $participantsData = $participants;
        $submissions = $responseData['submissions']??[];
        $participantsObj = $participants;

        foreach ($participantsObj as $participantId => $participant) {
            $dist = [
                'participantId' => $participantId,
                'userName' => $participant[0],
                'name' => $participant[1],
                'solveCount' => 0,
                'upSolveCount' => 0,
                'isPresent' => false,
                'solves' => self::problemIndexGenerate(),
            ];
            $participantsData[$participantId] = $dist;
        }

        foreach ($submissions as $submission) {
            if ($submission[2] == 1) {
                if ($participantsData[$submission[0]]['solves'][$submission[1]] == 0) {
                    $participantsData[$submission[0]]['solves'][$submission[1]] = 1;
                    if ($submission[3] > $time) {
                        $participantsData[$submission[0]]['upSolveCount'] += 1;
                    } else {
                        $participantsData[$submission[0]]['solveCount'] += 1;
                        $participantsData[$submission[0]]['isPresent'] = true;
                    }
                }
            } else {
                if ($submission[3] <= $time) {
                    $participantsData[$submission[0]]['isPresent'] = true;
                }
            }
        }

        $data = [];
        foreach ($participantsObj as $participantId => $participant) {
            $tmp = [
                'userid' => $participantId,
                'userName' => $participantsData[$participantId]['userName'],
                'contestSolve' => $participantsData[$participantId]['solveCount'],
                'upSolve' => $participantsData[$participantId]['upSolveCount'],
                'isPresent' => $participantsData[$participantId]['isPresent'],
            ];
            $data[$participantsData[$participantId]['userName']] = $tmp;
        }


        // Return solve and upsolve counts
        return [
            'solve_count' => $data[$username]['contestSolve'] ?? 0,
            'upsolve_count' => $data[$username]['upSolve'] ?? 0,
            'absent' => !($data[$username]['isPresent'] ?? false),
        ];

    }

    private static function problemIndexGenerate()
    {
        $totalProblem = 50;
        $dist = [];
        for ($i = 0; $i < $totalProblem; $i++) {
            $dist[$i] = 0;
        }
        return $dist;
    }
}
