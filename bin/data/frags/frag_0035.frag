#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define PI 3.14159265359

//
// Description : Array and textureless GLSL 2D/3D/4D 
//               noise functions.
//      Author : People
//  Maintainer : Anyone
//     Lastmod : 20120109 (Trisomie21)
//     License : No Copyright No rights reserved.
//               Freely distributed
//
float snoise(vec3 uv)
{
	const vec3 s = vec3(1e0, 1e2, 1e4);
	vec3 f = fract(uv);
	f = f*f*(3.0-2.0*f);
	uv = floor(uv);
	vec4 v = vec4(dot(uv, s)) + vec4(0., s.x, s.y, s.x+s.y);
	vec4 r = fract(sin(v*1e-3)*1e5);
	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	r = fract(sin((v+s.z)*1e-3)*1e5);
	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	return mix(r0, r1, f.z)*2.-1.;
}

//rob dot dunn at gmail 
//Inspired by Ken Perlin's slides: http://www.noisemachine.com/talk1/24a.html
void main( void ) {
	vec2 p = ( gl_FragCoord.xy / resolution.xy ) - vec2(0.5);
	p.x *= resolution.x/resolution.y;		
	float color1 = 3.0 - (3.*length(2.*p));
	float color2 = 3.0 - (3.*length(2.*p));
	for(int i = 1; i <= 8; i++)
	{
		float power = pow(2.0,float(i));
		color1 -= ( (1.5 / power) * snoise( 2.*vec3( (atan(p.y,p.x))*power, (2.*length(p)-(time/16.))*power,  (time/8.) ) ) );
		color2 -= ( (1.5 / power) * snoise( 2.*vec3( (atan(p.y,-p.x)+2.*PI)*power, (2.*length(p)-(time/16.))*power,  (time/8.) ) ) );
	}
	color1 *= smoothstep(PI,0.,(abs(atan(p.y,p.x))));
	color2 *= smoothstep(PI,0.,(abs(atan(p.y,-p.x))));
	float color = color1+color2;

	gl_FragColor = vec4( color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15 , 1.0 );
	if(length(p)<0.25) gl_FragColor = vec4(0.0);
}