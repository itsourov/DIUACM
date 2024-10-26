<?php

	namespace App\Listeners;

	use App\Enums\AccessStatuses;
    use App\Enums\UserType;
    use App\Events\EventNotification;
	use App\Mail\EventNotificationMail;
	use App\Models\User;
	use Illuminate\Contracts\Queue\ShouldQueue;
	use Illuminate\Queue\InteractsWithQueue;
	use Illuminate\Support\Facades\Mail;

	class EventNotificationListener
	{
//		use InteractsWithQueue;

		/**
		 * Create the event listener.
		 */
		public function __construct()
		{
			//
		}

		/**
		 * Handle the event.
		 */
		public function handle(EventNotification $eventNotification): void
		{
			$event = $eventNotification->event;
			if ($event->organized_for == AccessStatuses::SELECTED_PERSONS) {
				$user = $event->groups()
					->with('users')
					->get()
					->pluck('users.*.email')
					->flatten()
					->unique()
					->toArray();

			} else if ($event->organized_for == AccessStatuses::OPEN_FOR_ALL) {
				$user = User::whereNot('type',UserType::MENTOR)
                    ->whereNot('type',UserType::Veteran)
                ->select('email')->pluck('email')->toArray();
			} else {
				//nothing
			}
			foreach ($user as $email) {
				Mail::to($email)->queue(new EventNotificationMail($event));
			}


		}
	}
