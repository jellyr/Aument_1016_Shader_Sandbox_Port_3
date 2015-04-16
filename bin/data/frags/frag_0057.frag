#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy );

	float color = 0.0;
	
	float dist = distance(position, vec2(0.5, 0.5));
	
	dist = pow(dist, 0.2)/0.01;
	
	float r = sin((20.0*dist) - (6.0*time));
	float g = sin((40.0*dist) + (4.5*time));
	float b = cos((55.0*dist) + (2.0*time));
	gl_FragColor = vec4(r, g, b, 1.0);
}