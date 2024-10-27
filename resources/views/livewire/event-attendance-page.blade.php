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
            <div class="">
                <p class="">
                    <b>Starting Time: </b>
                    {{ $event->starting_time->format('h:i A, d M Y (D)') }}
                </p>

            </div>
            <div class="">
                <p>
                    <b>Ending Time: </b>
                    {{ $event->ending_time->format('h:i A, d M Y (D)') }}
                </p>

            </div>
            <div class="">
                <p>
                    <b>Event duration: </b>
                    {{ $event->starting_time->diff($event->ending_time)->forHumans() }}
                </p>

            </div>
            @if($event->contest_link)
                <div class=" ">
                    <p class="">
                        <b>Contest Link: </b>
                        <a class="text-blue-500 inline " target="_blank"
                           href="{{ $event->contest_link }}"> {{ $event->contest_link }}</a>
                    </p>

                </div>
            @endif


        </div>
        <div>
            {!! $event->description !!}
        </div>
        <div class="mt-3 md:mt-6 flex justify-center">
            <div id="countDown" class="flex flex-col md:pl-10 md:-mt-6">
                <div class=" text-xl mb-2 text-skin-green text-center">
                 Starts in
                </div>


                <div class="flex flex-row flex-wrap justify-center  gap-2 "
                     x-data="countdown('{{$event->starting_time}}')">
                    <div
                        class="flex flex-col items-center justify-center bg-yellow-500 rounded-lg text-white p-2.5">
                                    <span class="countdown"><span id="days"
                                                                  class="text-base md:text-3xl font-bold"><span
                                                x-text="daysLeft"></span></span><span
                                            class="text-lg ml-2">Days</span></span>
                    </div>
                    <div
                        class="flex flex-col items-center justify-center bg-yellow-500 rounded-lg text-white p-2.5">
                                    <span class="countdown"><span id="hours"
                                                                  class="text-base md:text-3xl font-bold"><span
                                                x-text="hoursLeft"></span></span><span
                                            class="text-lg ml-2">Hours</span></span>
                    </div>
                    <div
                        class="flex flex-col items-center justify-center bg-yellow-500 rounded-lg text-white p-2.5">
                                    <span class="countdown"><span id="minutes"
                                                                  class="text-base md:text-3xl font-bold"><span
                                                x-text="minutesLeft"></span></span><span
                                            class="text-lg ml-2">Minutes</span></span>
                    </div>

                    <div
                        class="flex flex-col items-center justify-center bg-yellow-500 rounded-lg text-white p-2.5">
                                    <span class="countdown"><span id="seconds"
                                                                  class="text-base md:text-3xl font-bold"><span
                                                x-text="secondsLeft"></span></span><span
                                            class="text-lg ml-2">Seconds</span></span>
                    </div>
                </div>
            </div>
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

    <script>
        function countdown(targetDate) {
            return {
                // Create the target date assuming it's in BST (Asia/Dhaka)
                targetDate: new Date(targetDate + ' +06:00'), // Append '+06:00' to ensure it's treated as BST
                daysLeft: null,
                hoursLeft: null,
                minutesLeft: null,
                secondsLeft: null,

                init() {
                    this.calculateTimeLeft();
                    setInterval(() => this.calculateTimeLeft(), 1000); // Update every second
                },

                calculateTimeLeft() {
                    const now = new Date(); // Get the current local time
                    const timeDiff = this.targetDate - now; // Get the time difference in milliseconds

                    if (timeDiff > 0) {
                        this.daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Days left
                        this.hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Hours left
                        this.minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)); // Minutes left
                        this.secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000); // Seconds left
                    } else {
                        this.daysLeft = 0;
                        this.hoursLeft = 0;
                        this.minutesLeft = 0;
                        this.secondsLeft = 0;
                    }
                }
            }
        }

    </script>
</div>
