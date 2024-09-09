<?php
	
	namespace App\Http\Middleware;
	
	use Closure;
	use Illuminate\Http\Request;
	use Symfony\Component\HttpFoundation\Response;
	
	class EnsureDiuEmail
	{
		/**
		 * Handle an incoming request.
		 *
		 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
		 */
		public function handle(Request $request, Closure $next): Response
		{
			// List of allowed domains
			$allowedDomains = ['diu.edu.bd', 's.diu.edu.bd'];
			
			$user = $request->user();
			
			if ($user) {
				foreach ($allowedDomains as $domain) {
					if (\Illuminate\Support\Str::endsWith($user->email, '@' . $domain)) {
						return $next($request);
					}
				}
			}
			
			abort(403, 'Unauthorized. Only university email addresses are allowed.');
		}
	}
