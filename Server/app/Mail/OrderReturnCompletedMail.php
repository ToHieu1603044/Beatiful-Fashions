<?php

namespace App\Mail;

use App\Models\OrderReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReturnCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $orderReturn; 

    public function __construct(OrderReturn $orderReturn)
    {
        $this->orderReturn = $orderReturn; 
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Return Completed Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order_return_completed',
            with: [
                'orderReturn' => $this->orderReturn
            ]
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
