<x-web-layout>
    <div class="container mx-auto px-2 py-10 space-y-6">
        <h3 class="text-center text-4xl font-marry font-semibold">About Us
        </h3>
        <x-card class="box space-y-5">
            <h3 class=" text-2xl font-marry font-semibold pt-5">
                Welcome to {{ config('app.name') }}!
            </h3>
            <p class=" text-lg">
                We're excited to have you here, part of a growing community dedicated to making exam preparation easier
                and more collaborative. {{ config('app.name') }} is not just a website; it's a shared resource built by
                students, for
                students.
            </p>

            <h3 class=" text-2xl font-marry font-semibold pt-5">
                Our Mission
            </h3>
            <p class=" text-lg">
                Our mission is simple: to create a platform where you can easily access previous year exam questions and
                contribute your own. We believe in the power of sharing knowledge, and together, we can create a cycle
                of support that benefits everyone.
            </p>



            <h3 class=" text-2xl font-marry font-semibold pt-5">
                Why Contribute?
            </h3>
            <p class=" text-lg">
                {{ config('app.name') }} thrives because of people like you. Your seniors have contributed their
                questions, which are
                now helping you succeed. Now it's your turn to contribute and ensure that your juniors have the
                resources they need. It's a beautiful cycle of giving and receiving, and your participation keeps it
                going.

            </p>




            <h3 class=" text-2xl font-marry font-semibold pt-5">
                Special Offer Just for You
            </h3>
            <p class=" text-lg">
                As a token of our appreciation, if you upload your questions to {{ config('app.name') }}, we'll give you
                a 1-year free
                subscription to Canva PRO! This is our way of saying thank you for helping us grow and for being an
                essential part of our community.
            </p>



            <h3 class=" text-2xl font-marry font-semibold pt-5">
                Join Us
            </h3>
            <p class=" text-lg">
                This platform is for all of us. Whether you're looking for exam resources or wanting to give back by
                uploading your own questions, {{ config('app.name') }} is here to support you. Together, we can build a
                comprehensive
                question bank that benefits everyone. <br>

                Thank you for being part of the {{ config('app.name') }} family. Let's support each other and make exam
                preparation a
                collective success! <br>
                <br>
                Warm regards, <br>
                <br>
                The {{ config('app.name') }} Team
            </p>























        </x-card>


    </div>



</x-web-layout>
