import os
from datetime import datetime
from flask import Flask, flash, render_template, session, redirect, url_for, request
from flask_bootstrap import Bootstrap4
from flask_moment import Moment
from flask_wtf import FlaskForm, RecaptchaField
from wtforms import StringField, SubmitField, SelectField, DateField, EmailField, PasswordField, BooleanField
from wtforms.validators import DataRequired,InputRequired
from flask_sqlalchemy import SQLAlchemy

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
app.config['SECRET_KEY'] = 'h@rd t0 guess String'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['RECAPTCHA_PUBLIC_KEY'] = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
app.config['RECAPTCHA_PRIVATE_KEY'] = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
bootstrap = Bootstrap4(app)
moment = Moment(app)
db = SQLAlchemy(app)

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role')

    def __repr__(self):
        return '<Role %r>' % self.name


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

    def __repr__(self):
        return '<User %r>' % self.username


class NameForm(FlaskForm):
    name = StringField('What is your name?', validators=[DataRequired()])
    submit = SubmitField('Submit')


class Account(db.Model):
    __tablename__ = 'Accounts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    gender = db.Column(db.String)
    email = db.Column(db.String)
    password = db.Column(db.String)
    birth = db.Column(db.String)
    nationality = db.Column(db.String)

    def __repr__(self):
        return '<Account %r>' % self.email

with app.app_context():
    db.create_all()

class RegisterForm(FlaskForm):
    name = StringField('Name', validators=[InputRequired()])
    gender = SelectField('Gender', choices=[
                         ('male', 'Male'), ('female', 'Female')])
    email = EmailField('Email')
    password = PasswordField('Password', validators=[InputRequired()])
    birth = DateField('Date of Birth')
    nationality = StringField('Nationality', validators=[InputRequired()])
    check = BooleanField('I have read and accept the private policy', validators=[DataRequired()])
    recaptcha = RecaptchaField()
    submit = SubmitField('Submit')
    


@app.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit() and request.method=="POST":
        current_user = User.query.filter_by(username=form.name.data).first()
        if current_user is None:
            current_user = User(username=form.name.data)
            db.session.add(current_user)
            db.session.commit()
            session['known'] = False
        else:
            session['known'] = True
        session['name'] = form.name.data
        return redirect(url_for('index'))
    return render_template('index.html', form=form, name=session.get('name'),
                           known=session.get('known'), current_time=datetime.utcnow())


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit() and request.method=="POST":
        current_email = Account.query.filter_by(email=form.email.data).first()
        if current_email is None:
            account = Account(
                name=request.form["name"],
                gender=request.form["gender"],
                email=request.form["email"],
                password=request.form["password"],
                birth=request.form["birth"],
                nationality=request.form["nationality"]
            )
            db.session.add(account)
            db.session.commit()
            flash('Successfully sign up!')
        else:
            flash('This email address has been used!')
        return redirect(url_for('register'))
    return render_template('register.html', form=form)


@app.route('/user/<name>')
def user(name):
    return render_template('user.html', name=name)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
