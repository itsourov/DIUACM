<?php
	
	namespace App\Mail;
	
	use Illuminate\Bus\Queueable;
	use Illuminate\Contracts\Queue\ShouldQueue;
	use Illuminate\Mail\Mailable;
	use Illuminate\Mail\Mailables\Content;
	use Illuminate\Mail\Mailables\Envelope;
	use Illuminate\Queue\SerializesModels;
	
	class ContactFormMail extends Mailable implements ShouldQueue
	{
		use Queueable, SerializesModels;
		public $name, $email, $phone, $subject, $message;
		
		/**
		 * Create a new message instance.
		 */
		public function __construct($name, $email, $phone, $subject, $message)
		{
			$this->name = $name;
			$this->email = $email;
			$this->phone = $phone;
			$this->subject = $subject;
			$this->message = $message;
		}
		
		/**
		 * Get the message envelope.
		 */
		public function envelope(): Envelope
		{
			return new Envelope(
				subject: 'Contact Form Mail',
			);
		}
		
		/**
		 * Get the message content definition.
		 */
		public function content(): Content
		{
			return new Content(
				markdown: 'emails.contact-form-mail',
			);
		}
		
		/**
		 * Get the attachments for the message.
		 *
		 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
		 */
		public function attachments(): array
		{
			return [];
		}
	}
