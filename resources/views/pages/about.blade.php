<x-web-layout>
	<div class="container mx-auto px-2 py-10 space-y-6">
		<h3 class="text-center text-4xl font-marry font-semibold">About Us
		</h3>
		<x-card class="box space-y-5 prose-base">
			<h3 class=" text-2xl font-marry font-semibold pt-5">
				Welcome to {{ config('app.name') }} Website!
			</h3>
			<p class=" text-lg">
				<b>DIU ACM</b> is a dedicated wing under the DIU CPC (Daffodil International University Competitive
				Programming
				Community), focused on fostering a thriving competitive programming culture within the university. Our
				community comprises passionate problem solvers and coding enthusiasts who regularly participate in
				programming contests, take classes from expert trainers, and mentor selected juniors in their journey to
				mastering competitive programming.
			</p>

			<p>At DIU ACM, we believe in learning through practice and teamwork. Our members actively engage in various
				activities, including:</p>
			<ul>
				<li><strong>Regular Contests</strong>: We organize and participate in coding contests to sharpen our
					skills and compete at national and international levels.
				</li>
				<li><strong>Trainer’s Classes</strong>: Senior competitive programmers and invited trainers conduct
					classes, covering advanced topics to help members improve their algorithmic and problem-solving
					abilities.
				</li>
				<li><strong>Junior Mentorship</strong>: Our experienced members take the responsibility of guiding and
					teaching promising juniors, ensuring the continuity of excellence in the community.
				</li>
			</ul>

			<h3 class=" text-2xl font-marry font-semibold pt-5">
				Our Mission
			</h3>
			<p class=" text-lg">
				This website serves as a central platform to manage and streamline our activities, including tracking
				attendance for classes, contests, and events. As we grow, we plan to introduce new features such as
				score calculation, individual progress tracking, and more, to better support the development of our
				members and help them achieve their competitive programming goals.
			</p>


			<h3 class=" text-2xl font-marry font-semibold pt-5">
				Join Us
			</h3>
			<p class=" text-lg">
				Together, we strive to make DIU ACM a hub of excellence in competitive programming at Daffodil
				International University.
				<br>
				The {{ config('app.name') }} Team
			</p>


		</x-card>


	</div>


</x-web-layout>
