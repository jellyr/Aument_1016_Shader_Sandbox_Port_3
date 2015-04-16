#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){

    // Global Settings
    ofSetLogLevel(OF_LOG_VERBOSE);
    resolHoriz = 1024;
    resolVert = 1024;
    show_fps = true;
    bHideCursor = false;
    
    // FBO Kaleidoscope
    resolPantalla = 1;
    pantallaFBOKaleidoscopeA.allocate( resolHoriz,   resolVert,   GL_RGB);
    pantallaFBOKaleidoscopeB.allocate( resolHoriz/2, resolVert/2, GL_RGB);
    pantallaFBOKaleidoscopeC.allocate( resolHoriz/4, resolVert/4, GL_RGB);

    pingPong.allocate( resolHoriz, resolVert, GL_RGB);
    pingPong.swap();

    ofDirectory dir;
	dir.listDir("frags/");
    int fragDirSize = dir.size();
    cout << fragDirSize << endl;
    for (int val = 0; val < fragDirSize; val++){
        stringstream nombre;
        if (val+1 < 10){
            nombre << "frags/frag_000" << val+1 << ".frag";
        } else if (val+1 < 100){
            nombre << "frags/frag_00" << val+1 << ".frag";
        } else if (val+1 < 1000){
            nombre << "frags/frag_0" << val+1 << ".frag";
        } else {
            nombre << "frags/frag_" << val+1 << ".frag";
        }
        ofBuffer buffer = ofBufferFromFile(nombre.str());
        string stringTemporal = string(buffer);
        frags.push_back(stringTemporal);
        fragNames.push_back(nombre.str());
    }
    nFrag = 0;
    passes = 1;
    // now compile the first shader
    bFine = true;
    compileCode();

    bKaleidoscope = false;
    KaleidoscopeSlices = 12;

}

//--------------------------------------------------------------
void ofApp::update(){

    updateShader(passes);

}

//--------------------------------------------------------------
void ofApp::draw(){

    ofBackground(0,0,0);
    ofSetColor(255,255,255);

    if(resolPantalla == 1 ){
        pantallaFBOKaleidoscopeA.begin();
    } else if (resolPantalla == 2 ){
        pantallaFBOKaleidoscopeB.begin();
    }else if (resolPantalla == 4 ){
        pantallaFBOKaleidoscopeC.begin();
    }
    ofClear(0,0,0,0);
    ofBackground(0,0,0);
    ofSetColor(255,255,255);
        ofEnableAlphaBlending();
        pingPong.dst->draw(0,0);

    if(resolPantalla == 1 ){
        pantallaFBOKaleidoscopeA.end();
    } else if (resolPantalla == 2 ){
        pantallaFBOKaleidoscopeB.end();
    }else if (resolPantalla == 4 ){
        pantallaFBOKaleidoscopeC.end();
    }

    if (bKaleidoscope == false){
        if(resolPantalla == 1 ){
            pantallaFBOKaleidoscopeA.draw(0,ofGetWindowHeight(),ofGetWindowWidth(),-ofGetWindowHeight());
        } else if (resolPantalla == 2 ){
            pantallaFBOKaleidoscopeB.draw(0,ofGetWindowHeight(),ofGetWindowWidth(),-ofGetWindowHeight());
        }else if (resolPantalla == 4 ){
            pantallaFBOKaleidoscopeC.draw(0,ofGetWindowHeight(),ofGetWindowWidth(),-ofGetWindowHeight());
        }

    } else {
        float distCentro = ofGetWindowHeight()/2;
        float nSlices = KaleidoscopeSlices*2;
        float angleTemp = 360/nSlices;
        float catOpuesto = tan(angleTemp*(PI/180))*distCentro;
        if(resolPantalla == 1 ){
            pantallaFBOKaleidoscopeA.getTextureReference().bind();
        } else if (resolPantalla == 2 ){
            pantallaFBOKaleidoscopeB.getTextureReference().bind();
        }else if (resolPantalla == 4 ){
            pantallaFBOKaleidoscopeC.getTextureReference().bind();
        }
            ofPushMatrix();
                ofTranslate((ofGetWindowWidth())/2,(ofGetWindowHeight())/2);
                for (int slice = 0; slice  < nSlices/2; slice++){
                    ofPushMatrix();
                    ofRotateZ(slice*angleTemp*2);
                        glBegin( GL_TRIANGLES );
                            glTexCoord2d( ((resolVert/resolPantalla)/2),                 ((resolVert/resolPantalla)/2)            ); glVertex2d(           0,           0);
                            glTexCoord2d( ((resolVert/resolPantalla)/2)+catOpuesto/resolPantalla+80/(float)resolPantalla , ((resolVert/resolPantalla)/2)+((float)distCentro/(float)resolPantalla) ); glVertex2d(  catOpuesto, -distCentro);
                            glTexCoord2d( ((resolVert/resolPantalla)/2)-catOpuesto/resolPantalla+80/(float)resolPantalla , ((resolVert/resolPantalla)/2)+((float)distCentro/(float)resolPantalla) ); glVertex2d( -catOpuesto, -distCentro);
                        glEnd();
                    ofPopMatrix();
                }
            ofPopMatrix();
        if(resolPantalla == 1 ){
            pantallaFBOKaleidoscopeA.getTextureReference().unbind();
        } else if (resolPantalla == 2 ){
            pantallaFBOKaleidoscopeB.getTextureReference().unbind();
        }else if (resolPantalla == 4 ){
            pantallaFBOKaleidoscopeC.getTextureReference().unbind();
        }
        ofSetColor(255,255,255);
        ofPushMatrix();
            ofTranslate(ofGetWindowWidth()/2,ofGetWindowHeight()/2);
            for (int slice = 0; slice  < nSlices/2; slice++){
                ofPushMatrix();
                ofRotateZ(slice*angleTemp*2);
                ofLine(  catOpuesto, -distCentro, -catOpuesto, -distCentro);
                ofPopMatrix();
            }
        ofPopMatrix();
    }

    
    if (show_fps == true){
        ofFill();
        ofSetColor(0,0,10,200);
        ofRect(0,0,300,190);
        ofSetColor(180,180,180);
        ofNoFill();
        ofRect(0,0,300,190);
        ofSetColor(255,255,255);
        ofDrawBitmapString("FPS: "+ofToString(ofGetFrameRate(), 2), 10, 1*15);
        ofDrawBitmapString("Some shader use your mouse movement!", 10, 2*15);
        ofDrawBitmapString("'f' Toggle Fullscreen.", 10, 3*15);
        ofDrawBitmapString("'s' Toggle Show INFO.", 10, 4*15);
        ofDrawBitmapString("'r' Change Resolution Divider: " +ofToString(resolPantalla), 10, 5*15);
        if( bKaleidoscope == true){
            ofDrawBitmapString("'k' Toggle Kaleidoscope: ON!", 10, 6*15);
            ofDrawBitmapString("'1' y '2' Kaleidoscope Slices: " +ofToString(KaleidoscopeSlices), 10, 7*15);
        } else {
            ofDrawBitmapString("'k' Toggle Kaleidoscope: OFF", 10, 6*15);
            ofSetColor(100,100,100);
            ofDrawBitmapString("'1' y '2' Kaleidoscope Slices: " +ofToString(KaleidoscopeSlices), 10, 7*15);
        }
        ofSetColor(255,255,255);
        ofDrawBitmapString("'Up' y 'Down' Cambia Shader", 10, 8*15);
        ofDrawBitmapString("Shader "+ofToString(nFrag+1)+ " de " +ofToString(frags.size()), 10, 9*15);
        if( bFine == true){
            ofSetColor(0,120,255);
            ofDrawBitmapString(ofToString(fragNames[nFrag]), 10,10*15);
            ofDrawBitmapString("Shader Loaded Correctly!", 10, 11*15);
        } else {
            ofSetColor(255,0,0);
            ofDrawBitmapString(ofToString(fragNames[nFrag]), 10,10*15);
            ofDrawBitmapString("Shader Loaded Incorrectly!", 10,11*15);
        }
        ofSetColor(255,255,255);
        ofDrawBitmapString("'h' Toggle hide Cursor.", 10, 12*15);
    }
    

}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

    switch (key){
        case 's':
            if (show_fps == true){
                show_fps = false;
            } else{
                show_fps = true;
            }
            break;
        case 'f':
            ofToggleFullscreen();
            break;
        case 'k':
            bKaleidoscope = !bKaleidoscope;
            break;
        case '2':
            if(bKaleidoscope == true){
                KaleidoscopeSlices+=2;
                if (KaleidoscopeSlices >= 100) KaleidoscopeSlices = 100;
            }
            break;
        case '1':
            if(bKaleidoscope == true){
                KaleidoscopeSlices-=2;
                if (KaleidoscopeSlices < 2) KaleidoscopeSlices = 2;
            }
            break;
        case OF_KEY_UP:
            nFrag++;
            if (nFrag >= frags.size()) nFrag = 0;
            cout << endl << "--------" << endl << " Loading Frag: "<< nFrag+1 << endl << "--------" << endl;
            setCode(frags[nFrag]);
            break;
        case OF_KEY_DOWN:
            nFrag--;
            if (nFrag < 0) nFrag = frags.size()-1;
            cout << endl << "--------" << endl << " Loading Frag: "<< nFrag+1 << endl << "--------" << endl;
            setCode(frags[nFrag]);
            break;
        case 'r':
            resolPantalla++;
            if (resolPantalla == 3) resolPantalla = 4;
            if (resolPantalla > 4) resolPantalla = 1;
            cout << resolPantalla << endl;
            pingPong.allocate( resolHoriz/resolPantalla, resolVert/resolPantalla, GL_RGB);
            pingPong.swap();
            break;
        case 'h':
            if (bHideCursor == true){
                bHideCursor = false;
                ofShowCursor();
            } else{
                bHideCursor = true;
                ofHideCursor();
            }
            break;
    }
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

// This portion of the code was taken from:
// patriciogonzalezvivo/ofxComposer
// I don't remember if it was ever modified, I never used this code for anything but testing.
// I didn't ask Patricio for permission. Will send him an email.

// As most objects on openFrameworks, ofxFXObject have to be updated() in order to process the information on the GPU
void ofApp::updateShader(int i){

    // This process is going to be repited as many times as passes variable said
    for(int i = 0; i < passes; i++) {

        // All the process it큦 done on the pingPong ofxSwapBuffer ( basicaly two ofFbo that have a swap() funtion )
        pingPong.dst->begin();

        ofClear(0);
        shader.begin();

        // The other ofFbo of the ofxSwapBuffer can be access by calling the unicode "backbuffer"
        shader.setUniformTexture("backbuffer", pingPong.src->getTextureReference(), 1 );

        // All the needed textures are provided to the shader by this loop
        for( int i = 0; i < nTextures; i++){
            string texName = "tex" + ofToString(i);
            shader.setUniformTexture(texName.c_str(), textures[i].getTextureReference(), i+2 );
            string texRes = "size" + ofToString(i);
            shader.setUniform2f(texRes.c_str() , (float)textures[i].getWidth(), (float)textures[i].getHeight());
        }
        // Also there are some standar variables that are passes to the shaders
        // this ones follows the standar used by Ricardo Caballero's webGL Sandbox
        // http://mrdoob.com/projects/glsl_sandbox/ and ShaderToy by Inigo Quilez http://www.iquilezles.org/apps/shadertoy/
        // webGL interactive GLSL editors
        //
        shader.setUniform1f("time", ofGetElapsedTimef() );
        shader.setUniform2f("size", (float)(resolHoriz/resolPantalla), (float)(resolVert/resolPantalla));
        shader.setUniform2f("resolution", (float)(resolHoriz/resolPantalla), (float)(resolVert/resolPantalla));
        shader.setUniform2f("mouse", ((float)ofGetMouseX()/(float)ofGetWindowWidth()), 1-((float)ofGetMouseY()/(float)ofGetWindowHeight()));

        // renderFrame() is a built-in funtion of ofxFXObject that only draw a white box in order to
        // funtion as a frame here the textures could rest.
        // If you want to distort the points of a textures, probably you want to re-define the renderFrame funtion.
            glBegin(GL_QUADS);
                glVertex3f(                         0,                       0, 0);
                glVertex3f(  resolHoriz/resolPantalla,                       0, 0);
                glVertex3f(  resolHoriz/resolPantalla, resolVert/resolPantalla, 0);
                glVertex3f(                         0, resolVert/resolPantalla, 0);
            glEnd();

        shader.end();

        pingPong.dst->end();

        pingPong.swap();    // Swap the ofFbo's. Now dst is src and src is dst
    }

    pingPong.swap();        // After the loop the render information will be at the src ofFbo of the ofxSwapBuffer
    // this extra swap() call will put it on the dst one. Witch sounds more reasonable...
};

bool ofApp::setCode(string _fragShader){
    bool loaded = false;

//    string shaderTemporalA = "#version 120\n\
//#extension GL_ARB_texture_rectangle : enable\n";
//    stringstream shaderTemporalB;
//    shaderTemporalB << shaderTemporalA << _fragShader << endl;
//    _fragShader = shaderTemporalB.str();

//    cout << _fragShader << endl;
    if ( fragmentShader != _fragShader ){

        ofShader test;
        test.setupShaderFromSource(GL_FRAGMENT_SHADER, _fragShader);
        bFine = test.linkProgram();

        if( bFine ){
            fragmentShader = _fragShader;
            loaded = compileCode();
        }
    }

    return loaded;
}

bool ofApp::compileCode(){

     string  fragmentShader = frags[nFrag];

    // Looks how many textures it큦 need on the injected fragment shader
    int num = 0;
    for (int i = 0; i < 10; i++){
        string searchFor = "tex" + ofToString(i);
        if ( fragmentShader.find(searchFor)!= -1)
            num++;
        else
            break;
    }

    // Check if it큦 the same number of tectures already created and allocated
    if ( num != nTextures ){
        // If the number of textures it큦 different
        if (textures != NULL ){
            if (nTextures > 0) {
                delete [] textures;
            }
        }
            // And initialate the right amount of textures
        nTextures = num;
        if (nTextures > 0){
            textures = new ofFbo[nTextures];
        } else if ( nTextures == 0 ){
            textures = NULL;
        }

        // In any case it will allocate the total amount of textures with the internalFormat need
        for( int i = 0; i < nTextures; i++){
            textures[i].allocate(resolHoriz/resolPantalla, resolVert/resolPantalla, GL_RGB);
            textures[i].begin();
            ofClear(0,255);
            textures[i].end();
        }
    }

    shader.unload();
    shader.setupShaderFromSource(GL_FRAGMENT_SHADER, fragmentShader);
    bFine = shader.linkProgram();

    return bFine;

}
