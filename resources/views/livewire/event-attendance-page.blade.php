<div class="space-y-4 mt-4">
    <x-card class="py-6 bg-white space-y-3">
        <h3 class="text-center text-4xl font-marry font-semibold">{{$event->title}}</h3>

        <div class=" space-y-1">

            <div class="flex items-center gap-2">
                <p>
                    <b>Contest Type: </b>
                </p>
                <span
                    class="inline-flex items-center gap-1">{{svg($event->type->getIcon(),'w-5 h-5')}}{{$event->type->getLabel()}}</span>
            </div>
            <div class="flex items-center gap-2">
                <p>
                    <b>Organized for: </b>
                </p>
                <span
                    class="inline-flex items-center gap-1">{{svg($event->organized_for->getIcon(),'w-5 h-5')}}{{$event->organized_for->getLabel()}}</span>
            </div>
            <div class="flex items-center gap-2">
                <p>
                    <b>Starting Time: </b>
                </p>
                {{ $event->starting_time->format('h:i A, d M Y (D)') }}
            </div>
            <div class="flex items-center gap-2">
                <p>
                    <b>Ending Time: </b>
                </p>
                {{ $event->ending_time->format('h:i A, d M Y (D)') }}
            </div>
            <div class="flex items-center gap-2">
                <p>
                    <b>Event duration: </b>
                </p>
                {{ $event->starting_time->diff($event->ending_time)->forHumans() }}
            </div>
            @if($event->contest_link)
                <div class="flex items-center gap-2">
                    <p>
                        <b>Contest Link: </b>
                    </p>
                    <a class="text-blue-500" target="_blank"
                       href="{{ $event->contest_link }}"> {{ $event->contest_link }}</a>
                </div>
            @endif


        </div>
        <div>
            {!! $event->description !!}
        </div>

    </x-card>

    @if($event->open_for_attendance  )
        <div class="space-y-1">
            @auth()
                @if(!$isPresent)
                    <x-profile-card :user="auth()->user()->loadMissing('media')" />
                @endif

            @endauth

            <div>
                @if ($this->attendanceAction->isVisible())
                    {{ $this->attendanceAction }}
                @endif

                @if($isPresent)
                    <div
                        class="mt-2 bg-teal-100 border border-teal-200 text-sm text-teal-800 rounded-lg p-4 dark:bg-teal-800/10 dark:border-teal-900 dark:text-teal-500"
                        role="alert" tabindex="-1" aria-labelledby="hs-soft-color-success-label">
                        <span id="hs-soft-color-success-label" class="font-bold">Success</span> You already gave
                        attendance.
                    </div>
                @endif

                <x-filament-actions::modals />
            </div>
        </div>
        <div>
            <h3 class="text-center text-2xl font-marry font-semibold mt-5">Event Attenders</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                @foreach($event->attenders as $user)
                    <x-profile-card :user="$user" />
                @endforeach
            </div>
        </div>
    @endif


</div>
