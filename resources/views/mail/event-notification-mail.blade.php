<x-mail::message>
# Upcoming Event: {{ $event->title }}

We are excited to inform you about an upcoming event. The event is scheduled to start soon!

<x-mail::panel>
**Start at:** {{ $event->starting_time->format('h:i A, d M Y (D)')}}
</x-mail::panel>

**Event Duration:** {{$event->starting_time->diff($event->ending_time)->forHumans() }}

**Rated For:** {{$event->trackers->pluck('title')->implode(', ') }}

<x-mail::button :url="route('events.show',$event)">
View Event Details
</x-mail::button>

Important :  [Rules & Regulation]({{route('home')}}#rules_section)

Thanks,<br>
{{ config('app.name') }}

</x-mail::message>
