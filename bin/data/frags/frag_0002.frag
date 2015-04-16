uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2DRect tex0;
uniform sampler2DRect tex1;

float pi = 3.141592653589793238462643383279;

void main( void ) {
	float tscale = 2.5;

	vec2 position = gl_FragCoord.xy / resolution.xy;

	float lum   = abs(tan(position.y * pi)) - pi/5.0;

	float red   = sin(position.x * 5.0 + time*tscale*1.00) * 2.0 - 1.0;
	float green = sin(position.x * 8.0 + time*tscale*1.33) * 2.0 - 1.0;
	float blue  = sin(position.x * 2.0 + time*tscale*1.93) * 2.0 - 1.0;

	gl_FragColor = vec4( vec3( lum + red, lum + green, lum + blue ), 1.0 );
}


