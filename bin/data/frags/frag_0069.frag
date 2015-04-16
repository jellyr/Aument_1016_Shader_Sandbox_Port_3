#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;

const float Tau		= 6.28;
const float speed       = .01;
const float density	= 0.05;
float shape	= sin(time * 0.25);

float random( vec2 seed ) {
	return fract(sin(seed.x+seed.y*1e3)*1e5);
}

float Cell(vec2 coord) {
	vec2 cell = fract(coord) * vec2(.4,2.) - vec2(.0,.5);
	return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;
}

void main( void ) {

	vec2 p = gl_FragCoord.xy / resolution - vec2(.5, .5);
	p.x += sin(time * 8.0 + random(p)) * 0.025;
	p.y += sin(time * 4.0 + 0.5) * 0.025;
	
	float a = fract(atan(p.x, p.y) / Tau);
	float d = length(p);
	
	vec2 coord = vec2(pow(d, shape), a)*256.;
	vec2 delta = vec2(speed*256., .5);
	
	float c = 0.;
	for(int i=0; i<3; i++) {
		coord += delta;
		c = max(c, Cell(coord));
	}
	
	gl_FragColor = vec4(c * d * (0.56 - length(p))) * 8.0 + random(p) * 0.05;
}