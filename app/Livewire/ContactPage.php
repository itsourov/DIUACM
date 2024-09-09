<?php

namespace App\Livewire;

use App\Mail\ContactFormMail;
use Carbon\CarbonInterval;
use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use DanHarrin\LivewireRateLimiting\WithRateLimiting;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Livewire\Component;

class ContactPage extends Component
{
    use WithRateLimiting;

    public $name, $email, $phone, $subject, $message;


    protected function rules(): array
    {
        return [

            'name' => 'required',
            'email' => 'required | email',
            'phone' => '',
            'subject' => '',
            'message' => 'required',


        ];
    }

    public function render():View
    {
        return view('livewire.contact-page');
    }

    public function mount(Request $request): void
    {
        $this->name = $request->user()?->name;
        $this->email = $request->user()?->email;
        $this->phone = $request->user()?->phone;
    }
    public function submit(): void
    {
        $this->validate();
        try {
            $this->rateLimit(3, 60 * 5);
            Mail::to('sourov2305101004@diu.edu.bd')->send(
                new ContactFormMail(
                    name: $this->name,
                    email: $this->email,
                    phone: $this->phone,
                    subject: $this->subject,
                    message: $this->message,
                )
            );

            Notification::make()
                ->title('Your message has been received')
                ->info()
                ->send();
        } catch (TooManyRequestsException $exception) {
            $time = CarbonInterval::seconds($exception->secondsUntilAvailable)->cascade()->forHumans();
            throw ValidationException::withMessages([

                'message' => "Slow down! Please wait $time",
            ]);
        }


        $this->reset(['message']);


    }
}
