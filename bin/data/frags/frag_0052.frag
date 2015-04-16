#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// public domain
#define N 40
#define PI2 (3.14159265*2.0)
void main( void ) {
	vec2 v = (gl_FragCoord.xy - resolution/2.0) / min(resolution.y,resolution.x) * 15.0;

	
	float t = time * 4.0;

	float factor = mouse.x * 1.0;
	float c = cos(mouse.y * PI2);
	float s = sin(mouse.y * PI2);
	
	
	for ( int i = 1; i <= N; i++ ){
		float d = float(i+3) / float(N);
		float x = v.x;
		float y = v.y + sin(v.x * d * 3.0 + t)/d*factor + cos(v.x * d + t)/d*factor;
		
		v.x = x * c - y * s;
		v.y = x * s + y * c;

	}
	float col = length(v)*0.25;
	gl_FragColor = vec4( cos(col), cos(col*2.0), cos(col*4.0), 1.0 );

}
