// changed by @hintz

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

vec2 c = vec2(0.5,0.5);

float pi = 3.14159;

vec3 hsv2rgb(float h,float s,float v) {
	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}

vec3 shader( vec2 p )
{
	// p = ( gl_FragCoord.xy / resolution.xy );

	vec3 color = vec3(0.0);
	vec2 uv = vec2(0.0);

	float a = atan((p.x-c.x)/(p.y-c.y));

	float d = sqrt((p.x-c.x)*(p.x-c.x)+(p.y-c.y)*(p.y-c.y));

	uv = vec2(mod(a*8.0+sin(d*0.0),pi*2.0)/pi*0.5,mod(d*4.0,1.0));

	float d2 = sqrt((uv.x-c.x)*(uv.x-c.x)+(uv.y-c.y)*(uv.y-c.y))*1.5;

	color = mix(vec3(0.2),hsv2rgb(d+time*0.5,1.0,1.0),d2);
	color = mix(color,vec3(1.0),pow(d2,4.0));

	//color = vec3(d);

	return vec3( color);
}

void main( void )
{
	vec2 p = ( gl_FragCoord.xy / resolution.xy );

	vec3 color = vec3(0.0);
	vec2 uv = vec2(0.0);

	float a = atan((p.x-c.x)/(p.y-c.y));

	float d = sqrt((p.x-c.x)*(p.x-c.x)+(p.y-c.y)*(p.y-c.y));
	d = (sin(d-time)+1.0)*d;

	uv = vec2(mod(a*8.0+sin(d*16.0+time),pi*2.0)/pi*0.5,mod(pow(d*8.0,0.75),1.0));

	d = sqrt((uv.x-c.x)*(uv.x-c.x)+(uv.y-c.y)*(uv.y-c.y));

	color = shader(uv);

	gl_FragColor = vec4( color, 1.0 );
}