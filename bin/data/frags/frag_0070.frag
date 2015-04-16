#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

//Some effect by MaGetzUb
float noise(vec3 p) //by. Las^Mercury
{
	vec3 i = floor(p);
	vec4 a = dot(i, vec3(1., 57., 21.)) + vec4(0., 57., 21., 78.);
	vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
	a = mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)), f.x);
	a.xy = mix(a.xz, a.yw, f.y);
	return length(a);

}

void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;

	float r = 0.0;
	float g = 0.0;
	float b = 0.0;
	vec3 metb1;
	metb1.x = resolution.x/2.;
	metb1.y = resolution.y/2.;
	metb1.z = 10.;
	metb1.x+=cos(time)*100.0;
	
	vec3 metb2 = vec3(mouse, 20);

	metb2.z = 120.;
	
	float dr = 0., dg = 0., db = 0.;
	for(int i = 0; i < 50; i++) {
		float u = noise(vec3(i, 1.0, 1.0)) *.5 - .15;
		float v = noise(vec3(u, i, 1.0)) * .25 + .25;
		vec2 pos = vec2(resolution.x * u, resolution.y*v);
		
		dr += cos(mod(time/2., 360.)+float(i)*2.) / length(gl_FragCoord.xy - pos.xy + vec2(sin(u), cos(time*v+float(i))*10.0));
		dg += cos(mod(time/2., 360.)+120.+float(i)*2.) / length(gl_FragCoord.xy - pos.xy + vec2(sin(u), cos(time*v+float(i))*10.0));
		db += cos(mod(time/2., 360.)+240.+float(i)*2.) / length(gl_FragCoord.xy - pos.xy + vec2(sin(u), cos(time*v+float(i))*10.0));
						
		/*d+= metb1.z/length(gl_FragCoord.xy - metb1.xy);
		d+= metb2.z/length(gl_FragCoord.xy - metb2.xy);
		d *= .25;*/
	}
	float c;


	r += dr;
	g += dg;
	b += db;
	
	//color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );
	//color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );
	//color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );
	//color *= sin( time / 10.0 ) * 0.5;

	gl_FragColor = vec4( vec3( r, g, b), 3.0 );

}