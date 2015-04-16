#ifdef GL_ES
precision mediump float;
#endif

// Posted by Trisomie21
// modified by @hintz
// and phree

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void)
{
	float scale = mouse.x / 0.3;
	float ring = 15.0;
	float radius = resolution.x*1.0;
	float gap = scale*.5;
	vec2 pos = gl_FragCoord.xy - resolution.xy*.5;
	
	float d = length(pos);
	
	// Create the wiggle
	d += (sin(pos.y*0.25/scale+time*0.01)*sin(pos.x*0.25/scale+time*.01))*scale*5.0;
	
	// Compute the distance to the closest ring
	float v = mod(d + radius/(ring*2.0), radius/ring);
	v = abs(v - radius/(ring*2.0));
	
	v = clamp(v-gap, 0.0, 1.0);
	
	d /= radius;
	vec3 m = fract(d*vec3(ring, ring, -ring));
	
	gl_FragColor = vec4(m*v, 1.0);
}