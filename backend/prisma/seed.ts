import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.popup.deleteMany();
  await prisma.file.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.link.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Existing data cleared\n');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const hashedUserPassword = await bcrypt.hash('User123!', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      username: 'admin',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✓ Admin created: ${admin.email} (username: ${admin.username})`);

  // Create Admin Profile
  console.log('📝 Creating admin profile...');
  const adminProfile = await prisma.profile.create({
    data: {
      userId: admin.id,
      displayName: 'System Administrator',
      bio: 'Platform administrator and support contact. Managing the Digital Profile Hub platform.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff&size=200',
      backgroundType: 'COLOR',
      backgroundColor: '#1e40af',
      backgroundImageUrl: null,
      isPublished: true,
      viewCount: 0,
    },
  });
  console.log(`✓ Admin profile created`);

  // Create Admin Theme
  console.log('🎨 Creating admin theme...');
  await prisma.theme.create({
    data: {
      profileId: adminProfile.id,
      mode: 'DARK',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      textColor: '#f9fafb',
      fontFamily: 'Inter',
      layout: 'CENTERED',
      buttonStyle: 'ROUNDED',
    },
  });
  console.log(`✓ Admin theme created`);

  // Create Admin Links
  console.log('🔗 Creating admin links...');
  await prisma.link.createMany({
    data: [
      {
        profileId: adminProfile.id,
        type: 'PLATFORM',
        platform: 'EMAIL',
        title: 'Email Support',
        url: 'mailto:admin@example.com',
        icon: '📧',
        order: 1,
        isVisible: true,
      },
      {
        profileId: adminProfile.id,
        type: 'PLATFORM',
        platform: 'GITHUB',
        title: 'GitHub',
        url: 'https://github.com/admin',
        icon: '🐙',
        order: 2,
        isVisible: true,
      },
      {
        profileId: adminProfile.id,
        type: 'CUSTOM',
        platform: null,
        title: 'Documentation',
        url: 'https://docs.example.com',
        icon: '📚',
        order: 3,
        isVisible: true,
      },
    ],
  });
  console.log(`✓ Admin links created (3)`);

  // Create Admin Contacts
  console.log('📞 Creating admin contacts...');
  await prisma.contact.createMany({
    data: [
      {
        profileId: adminProfile.id,
        type: 'EMAIL',
        value: 'admin@example.com',
        label: 'Work',
        order: 1,
      },
      {
        profileId: adminProfile.id,
        type: 'EMAIL',
        value: 'support@example.com',
        label: 'Support',
        order: 2,
      },
    ],
  });
  console.log(`✓ Admin contacts created (2)`);

  // Create Admin Popup
  console.log('💬 Creating admin popup...');
  await prisma.popup.create({
    data: {
      profileId: adminProfile.id,
      isEnabled: true,
      message: '👋 Welcome! Contact me for platform support and assistance.',
      duration: 5000,
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
    },
  });
  console.log(`✓ Admin popup created\n`);

  // Create Regular User
  console.log('👤 Creating regular user...');
  const user = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      passwordHash: hashedUserPassword,
      username: 'johndoe',
      role: 'USER',
      isActive: true,
    },
  });
  console.log(`✓ User created: ${user.email} (username: ${user.username})`);

  // Create User Profile
  console.log('📝 Creating user profile...');
  const userProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      displayName: 'John Doe',
      bio: 'Full-stack developer passionate about building great user experiences. Coffee enthusiast ☕ | Open source contributor 🚀 | Always learning 📚',
      avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff&size=200',
      backgroundType: 'COLOR',
      backgroundColor: '#059669',
      backgroundImageUrl: null,
      isPublished: true,
      viewCount: 42,
    },
  });
  console.log(`✓ User profile created`);

  // Create User Theme
  console.log('🎨 Creating user theme...');
  await prisma.theme.create({
    data: {
      profileId: userProfile.id,
      mode: 'LIGHT',
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      textColor: '#1f2937',
      fontFamily: 'Poppins',
      layout: 'CENTERED',
      buttonStyle: 'PILL',
    },
  });
  console.log(`✓ User theme created`);

  // Create User Links
  console.log('🔗 Creating user links...');
  await prisma.link.createMany({
    data: [
      {
        profileId: userProfile.id,
        type: 'PLATFORM',
        platform: 'GITHUB',
        title: 'GitHub',
        url: 'https://github.com/johndoe',
        icon: '🐙',
        order: 1,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'PLATFORM',
        platform: 'LINKEDIN',
        title: 'LinkedIn',
        url: 'https://linkedin.com/in/johndoe',
        icon: '💼',
        order: 2,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'PLATFORM',
        platform: 'TWITTER',
        title: 'Twitter',
        url: 'https://twitter.com/johndoe',
        icon: '🐦',
        order: 3,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'PLATFORM',
        platform: 'YOUTUBE',
        title: 'YouTube Channel',
        url: 'https://youtube.com/@johndoe',
        icon: '📺',
        order: 4,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'PLATFORM',
        platform: 'MEDIUM',
        title: 'Medium Blog',
        url: 'https://medium.com/@johndoe',
        icon: '✍️',
        order: 5,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'CUSTOM',
        platform: null,
        title: 'Personal Website',
        url: 'https://johndoe.com',
        icon: '🌐',
        order: 6,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'CUSTOM',
        platform: null,
        title: 'Portfolio',
        url: 'https://portfolio.johndoe.com',
        icon: '💼',
        order: 7,
        isVisible: true,
      },
      {
        profileId: userProfile.id,
        type: 'CUSTOM',
        platform: null,
        title: 'Buy Me a Coffee',
        url: 'https://buymeacoffee.com/johndoe',
        icon: '☕',
        order: 8,
        isVisible: true,
      },
    ],
  });
  console.log(`✓ User links created (8)`);

  // Create User Contacts
  console.log('📞 Creating user contacts...');
  await prisma.contact.createMany({
    data: [
      {
        profileId: userProfile.id,
        type: 'EMAIL',
        value: 'john.doe@example.com',
        label: 'Personal',
        order: 1,
      },
      {
        profileId: userProfile.id,
        type: 'EMAIL',
        value: 'john@work.com',
        label: 'Work',
        order: 2,
      },
      {
        profileId: userProfile.id,
        type: 'PHONE',
        value: '+1234567890',
        label: 'Mobile',
        order: 3,
      },
    ],
  });
  console.log(`✓ User contacts created (3)`);

  // Create User Files
  console.log('📄 Creating user files...');
  await prisma.file.createMany({
    data: [
      {
        profileId: userProfile.id,
        filename: 'resume-john-doe.pdf',
        originalName: 'John_Doe_Resume_2024.pdf',
        title: 'My Resume',
        fileUrl: 'https://example.com/files/resume.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        order: 1,
      },
      {
        profileId: userProfile.id,
        filename: 'portfolio-2024.pdf',
        originalName: 'Portfolio_2024.pdf',
        title: 'Design Portfolio',
        fileUrl: 'https://example.com/files/portfolio.pdf',
        fileSize: 1048576,
        mimeType: 'application/pdf',
        order: 2,
      },
      {
        profileId: userProfile.id,
        filename: 'certifications.pdf',
        originalName: 'Professional_Certifications.pdf',
        title: 'Certifications',
        fileUrl: 'https://example.com/files/certs.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        order: 3,
      },
    ],
  });
  console.log(`✓ User files created (3)`);

  // Create User Popup
  console.log('💬 Creating user popup...');
  await prisma.popup.create({
    data: {
      profileId: userProfile.id,
      isEnabled: true,
      message: '🎉 New project launching soon! Follow me for updates.',
      duration: 7000,
      backgroundColor: '#10b981',
      textColor: '#ffffff',
    },
  });
  console.log(`✓ User popup created\n`);
  console.log('📋 Summary:');
  console.log('   • Admin user: admin@example.com / Admin123!');
  console.log('   • Regular user: john.doe@example.com / User123!');
  console.log('   • Admin profile: http://localhost:5173/admin');
  console.log('   • User profile: http://localhost:5173/johndoe');
  console.log('\n🚀 You can now login with either account!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
