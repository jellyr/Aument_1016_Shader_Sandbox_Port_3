#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// public domain
#define N 40
#define PI2 (3.14159265*2.0)

float saw(float f){ return fract(f+0.5)-0.5; }

void main( void ) {
	vec2 v = (gl_FragCoord.xy - resolution/2.0) / min(resolution.y,resolution.x) * 0.5;

	
	float t = time * 0.5;

	float factor = mouse.x * 0.25;
	float c = cos(mouse.y * PI2 * 0.4);
	float s = sin(mouse.y * PI2 * 0.4);
	
	
	for ( int i = 1; i <= N; i++ ){
		float d = float(i+N*3) / float(N);
		float x = v.x;
		float y = v.y + saw(v.x * d * 2.0 + t)/d*factor + saw(v.x * d - t)/d*factor;
		
		v.x = x * c - y * s;
		v.y = x * s + y * c;

	}
	float col = length(v)*4.0;
	gl_FragColor = vec4( cos(col), cos(col*2.0), cos(col*4.0), 1.0 );

}
