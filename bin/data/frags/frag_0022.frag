uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
// dashxdr work in progress...
// trying to recreate this:
// http://www.linuxmotors.com/inkpoly
// but it's not as good. Original came from here:
// http://www.linuxmotors.com/SDL_basic
// See the cool14.bas program...

void main( void ) {

	vec3 color = vec3(0.0, 1.0, 0.);
	vec2 pos = ( 2.0 * gl_FragCoord.xy - resolution.xy) / resolution.xx;
	float a = atan(pos.y, pos.x) + 3.1415927;

	float r = length(pos);
	float dn = mod(floor(4.0 + time*.02), 9.0);
	if(dn>4.0) dn = 8.0-dn;
	dn -= 4.0;
	float n = 18.0 + dn*4.0;
	float span = 6.2831853 / n;

	a = fract(a/span);
	float f = 1.0 - r;
	float f2 = 2.0*f - 1.0;
	float center = f2 * sin(time*.2172772)*6.0;
	float wide = sin(time*.1)*8.3*(r+.3);
	float low = center - wide;
	float high = center + wide;
	float count = .5 * (floor(high-a) + floor(a-low));
	color.r = color.b = (fract(count)<.4) ? 0.0 : 1.0;

	gl_FragColor = vec4( color, 1.0 );

}