/**
	classical raymarching as it has increasingly spread the world since iQ's various great tutorials.

	License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

	@version 2013/04/17 (c) def.gsus- modular-audio-graphics.com
		source is all genuine, algorithms are nothing new, though.
		this version has some issues especially with the shadow and surface finding precission
		all parameters are choosen to hide these artifacts as much as possible ;)
		greetings to to the DK class at angewandte/vienna :D
*/


#ifdef GL_ES
precision mediump float;
#endif

// the common inputs
uniform float time;
uniform vec2 resolution;


/* * * * * * global defines * * * * * * */

// distance for normal calculation
#define NORM_EPS 0.01
// minimum distance to a surface to count as 'hit'
// (note that this value must be greater as 0.0, since
// it would take unlimited steps to actually reach the zero)
#define MIN_DISTANCE 0.003
// distance of full fog
#define MAX_DISTANCE 12.0
// fixed number of steps per ray
#define MAX_RAY_STEP 100
// number of steps per shadow ray
#define MAX_SHADOW_STEP 28
// ray forwarding stepsize, range >0 .. 1
// less value is more precission,
// more precission needs more ray steps (above)
// increasing precission is nescessary when
// the scene function is not a true distance function,
// e.g. is modulated by a function of x,y,z
#define PRECISSION 0.8
// same for shadow rays
#define SHADOW_PRECISSION 0.6
// sharpness of smooth shadow [1, 100+]
#define SHADOW_EDGE 200.0

// enable direct light source visibility
// it's pretty hacky but nice
// only it shines a bit through objects
#define DO_DIRECT_LIGHT
// visibility of direct light
#define LIGHT_AMP 0.3
#define LIGHT_EXP 50.0

// enable shadow casting
#define DO_SHADOW

// height of the displacement from impact waves
#define WAVES_HEIGHT 0.03

// base color of environment
const vec3 ambient_col	= vec3(0.2, 0.25, 0.2);
// position of lightsource
      vec3 light_pos 	= vec3(7.0*sin(time*0.3), 1.0+0.1*cos(time/2.43), 2.0*cos(time*0.3));
// color of lightsource
const vec3 light_col  	= vec3(1.0, 1.0, 0.7);
// used as fog
const vec3 sky_col	= vec3(0.1, 0.1, 0.145);



// ################# basic geom functions ###########################

#define PI 3.14159265

/** rotate counter-clockwise in degree */
vec3 rotateX(in vec3 v, in float deg)
{
	float
		ca = deg * PI / 180.0,
		sa = sin(ca);
		ca = cos(ca);

	return vec3(
			v.x,
			v.y * ca - v.z * sa,
			v.y * sa + v.z * ca
			);
}

// quantize a value A to a stepsize of B
float quant(in float A, in float B)
{
	return floor(A/B)*B;
}


// ################ the scene #######################################


/* calculates the waves propagating out from an impact point sp,
   at time ph.
   returns distance to sp in x and height in y.
   pos and sp are expected to be on the same plane.
   */
vec2 impact_waves(vec2 pos, vec2 sp, float ph)
{
	// distance from sphere on floor plane
	float sd = distance(pos, sp);

	// moment of impact
	float impct = 1.0 - mod(ph - 0.4*sd + 0.32,1.0);

	// shape impact envelope
	// (fade from 0 to 1 and back)
	impct = pow(impct * (1.0-impct) * 4.0, 5.0);

	// return distance and
	// propagating waves
	return vec2(sd, impct * WAVES_HEIGHT * cos(sd*20.0-30.0*ph));
}


// return distance to scene surface
// the scene consists only of a ground and back plane
// a jumping sphere, and smaller spheres in a row
// the ground plane is displaced with waves originating from the impact of the jumping sphere
// the small spheres are simulated to move with the displacement of the ground plane
float scene_dist(vec3 pos)
{
//	pos.y += 0.03*sin(pos.z*10.0)*sin(pos.x*10.0);

	// phase of jump animation
	float ph = time*0.8;

	// position of jumping sphere
	vec3 sp = vec3(0.0, abs(sin(ph*PI)), 0.0);

	// create the sphere
	float d = distance(pos, sp)-1.0;

	// calculate waves propagating out
	vec2 waves = impact_waves(pos.xz, sp.xz, ph);

	// union with bottom floor y = -1
	// floor height is displaced with a sine on the sphere distance
	d = min(d, dot(pos, vec3(0,1,0)) + 1.0 + waves.y);

	// back wall
	d = min(d, dot(pos, vec3(0,0,1)) + 3.0 + 0.001*cos(pos.x*1.0)*cos(pos.y*10.0));

	// small spheres along x axis
	vec3 ssp=vec3(mod(pos.x,1.2)-0.6,pos.y+0.7,pos.z+1.0);

	// displacement of small sphere from height of floor
	// note that we need to quantize the pos.x value,
	// we do not want the surface of the sphere displaced,
	// rather the whole sphere should move up and down with
	// the wave present at it's center.
	// also the z coordinate is given as constant, not pos.z
	ssp.y += impact_waves(
		vec2(quant(pos.x,1.2), -1.0),
		sp.xz, ph).y;

	// small spheres
	d = min(d, length(ssp)-0.3);

#ifdef DO_DIRECT_LIGHT
	// distance to light
	// since we wan't to catch the light later on while raymarching
	// we need to make sure we do not go pass the light in too large steps
	// this is a sphere of radius -0.1, only used to get the raymarcher close to it
	d = min(d, distance(pos, light_pos)+0.1);
#endif

	return d;
}

// get normal at any point in scene
vec3 scene_norm(vec3 pos)
{
	return normalize(
		vec3(
			scene_dist(pos + vec3(NORM_EPS,0.0, 0.0)) - scene_dist(pos - vec3(NORM_EPS, 0.0, 0.0)),
			scene_dist(pos + vec3(0.0,NORM_EPS, 0.0)) - scene_dist(pos - vec3(0.0, NORM_EPS, 0.0)),
			scene_dist(pos + vec3(0.0,0.0, NORM_EPS)) - scene_dist(pos - vec3(0.0, 0.0, NORM_EPS)) )
	);
}


// return a light multiplier for
// a ray from 'pos' along 'dir' (norm)
float shadow_ray(vec3 pos, vec3 dir)
{
#ifndef DO_SHADOW
	return 1.0;
#else
	float sh = 1.0;
	// counter for ray travel distance
	float t = 0.001;
	for (int i=0; i<MAX_SHADOW_STEP; ++i)
	{
		// get distance to objects
		float d = scene_dist(pos + dir * t);

		// break if hit surface
		// breaking seems to be ok in webgl when returning a constant?!?
		//if (d<MIN_DISTANCE) return 0.0;

		// sample average closest distance
		sh = min(sh, SHADOW_EDGE * d / t);

		// forward ray
		//pos += d * dir * SHADOW_PRECISSION;
		t += d * SHADOW_PRECISSION;
	}
	return sh;
#endif
}


/*	render the whole scene
	'dir' is normalized direction
	returns color for ray from pos along dir

	this is the main raytracer function,
	reflections are handled inside a loop.
*/
vec3 raytrace(in vec3 pos, in vec3 dir)
{
	vec3
	// color accumulator
		sum,

	// the amount of reflection influence
	// which decreases with every reflection
		refl_amp = vec3(1.0);
	// amount of direct light
	float	light_amp = 1.0;

	// current distance travelled along ray
	float 	t = 0.0;

	// find the surface
	// if the surface is found and there are raytracing steps left,
	// then do the reflected ray
	for (int i=0; i<MAX_RAY_STEP; ++i)
	{
		// position on ray
		vec3 p = pos + t * dir;
		// distance to objects
		float d = scene_dist(p);

		if (d < MIN_DISTANCE)
		{
			// we've hit something

			// get the normal of the object
			vec3 snorm = scene_norm(p);

			// make sure that point is not inside surface (for reflection)
			p += 1.1*snorm * MIN_DISTANCE;

			// -- get object color --

			// direction towards light
			vec3 lnorm = normalize(light_pos - p);

			// test for shadow
			float sh = shadow_ray(p, lnorm);

			// calculate light influence
			float L = max(0.0, dot(snorm, lnorm));
			// shape light influence with exponent
			L = pow(L, 2.0);

			// object color
			vec3 c = (0.3+0.7*sh) * (ambient_col + snorm * 0.1);
			// plus light
			c += sh * 0.4 * L * light_col;

			// amount of fog [0,1]
			float fog = min(1.0, t / MAX_DISTANCE);
			// blend to fog color
			c = mix(c, sky_col, fog);

			// add color to accumulator for this ray
			sum += c * refl_amp;

			// reflect incoming ray around scene normal
			// (its easy in GLSL)
			dir = reflect(dir, snorm);
			t = 0.0;
			pos = p;

			// decrease influence of reflected colors
			refl_amp *= (1.0-fog) * 1.3 * (0.4 + 0.6 * c);

			// no direct light in reflection within shadow
			light_amp *= sh;
			// also less direct light in reflections at all
			light_amp *= 0.2;
		}

	#ifdef DO_DIRECT_LIGHT
		// sample direct light at each step
		sum += light_col * LIGHT_AMP * light_amp
			* pow(max(0.0, dot(dir, normalize(light_pos - p))), LIGHT_EXP)
			/ (1.0+t);
	#endif
		// forward ray
		// (but only as much as to the next surface)
		t += d * PRECISSION;
	}

	return sum;
}





void main()
{
	// get screen coordinate [-1, 1]
	vec2 scr_pos = gl_FragCoord.xy / resolution.yy * 2.0 - 1.0;

	// define direction of camera
	// this is a quick approx. of a perspective projection
	// the z value defines the field-of-view
	// also note that negative Z is forwarda
	vec3 dir = normalize(vec3(scr_pos, -2.0));

	// phase of up/down movement
	float udph = time * 0.33;

	// turn the camera
	dir = rotateX(dir, sin(udph) * 20.0 - 10.0);

	// position of camera
	vec3 pos = vec3(
			-3.0 + sin(time*0.2),
			1.0 + sin(udph+PI),
			4.5);

	// output ray color
	gl_FragColor = vec4(raytrace(pos, dir), 1.0);
}
